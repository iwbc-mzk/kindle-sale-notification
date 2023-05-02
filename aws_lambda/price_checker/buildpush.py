import subprocess
import json
import sys
import os
import re
import shutil
from distutils.dir_util import copy_tree


LAMBDA_DIR = "../aws_lambda"

def main():
    input_data = json.load(sys.stdin)
    
    region = input_data["AWS_REGION"]
    account_id = input_data["AWS_ACCOUNT_ID"]
    repo_url = input_data["REPO_URL"]
    container_name = input_data["CONTAINER_NAME"]

    pc_dir = os.path.join(LAMBDA_DIR, "price_checker")
    wk_dir = os.path.join(pc_dir, "work")
    copy_tree(os.path.join(LAMBDA_DIR, "image_base"), wk_dir)
    shutil.copy2(os.path.join(pc_dir, "price_checker.py"), f"{wk_dir}/app.py")

    # Docker login
    subprocess.call(
        f"aws ecr get-login-password --region {region} | docker login --username AWS --password-stdin {account_id}.dkr.ecr.{region}.amazonaws.com > /dev/null",
        shell=True
    )
    
    # Build image
    subprocess.call(f"docker build -t {container_name} {wk_dir} > /dev/null", shell=True)

    # Tag
    subprocess.call(f"docker tag {container_name}:latest {repo_url}:latest > /dev/null", shell=True)
    

    # Push image
    output_b: bytes = subprocess.check_output(f"docker push {repo_url}:latest", shell=True)
    output: str = output_b.decode("utf-8")
    
    # image url
    r = r"sha256:[a-z0-9]*"
    hash_digest = re.search(r, output).group()
    image_uri = f"{repo_url}@{hash_digest}"

    # 後片づけ
    shutil.rmtree(wk_dir)

    json.dump({"image_uri": image_uri}, sys.stdout) 
    

if __name__ == "__main__":
    main()
