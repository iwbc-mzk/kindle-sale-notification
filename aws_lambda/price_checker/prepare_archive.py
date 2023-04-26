import subprocess
import sys
import json
import os

input_data = json.load(sys.stdin)
layer_dir = input_data["layer_dir"]
requirements_path = input_data["requirements_path"]

python_dir = os.path.join(layer_dir, "python")

subprocess.run(f"mkdir {layer_dir}", shell=True)
subprocess.run(f"mkdir {python_dir}", shell=True)
subprocess.run(f"python3 -m pip install -q -r {requirements_path} -t {python_dir}", shell=True)

json.dump({"path": layer_dir}, sys.stdout)
