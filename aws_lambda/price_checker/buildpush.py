import argparse
import subprocess
import os
import shutil
from distutils.dir_util import copy_tree


def main(repo_url, password, proxy_endpoint):
    pc_dir = "./price_checker"
    wk_dir = os.path.join(pc_dir, "work")
    os.makedirs(wk_dir, exist_ok=True)
    copy_tree("./image_base", wk_dir)
    shutil.copy2(
        os.path.join(pc_dir, "price_checker.py"),
        os.path.join(wk_dir, "app.py")
    )

    # Build image
    subprocess.call(
        f"docker build -t {repo_url}:latest {wk_dir}",
        shell=True,
        stdout=subprocess.DEVNULL
    )

    # Docker login
    subprocess.call(
        f"docker login --username AWS --password {password} {proxy_endpoint}",
        shell=True,
        stdout=subprocess.DEVNULL
    )

    # Push image
    subprocess.call(
        f"docker push {repo_url}:latest",
        shell=True,
        stdout=subprocess.DEVNULL
    )

    # 後片づけ
    shutil.rmtree(wk_dir)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("repo_url")
    parser.add_argument("password")
    parser.add_argument("proxy_endpoint")
    args = parser.parse_args()
    main(args.repo_url, args.password, args.proxy_endpoint)
