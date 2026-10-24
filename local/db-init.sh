#!/bin/bash
set -euo pipefail
sed 's/\r$//' /worklenz-init/00_init.sh > /tmp/worklenz-db-init.sh
bash /tmp/worklenz-db-init.sh
