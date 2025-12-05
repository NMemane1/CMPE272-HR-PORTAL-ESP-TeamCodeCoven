#!/bin/bash

set -e

DB_HOST="${db_host}"
DB_USER="${db_user}"
DB_PASS="${db_pass}"

for i in {1..60}; do (echo > /dev/tcp/${db_host}/3306) >/dev/null 2>&1 && break; sleep 5; done

if command -v cloud-init >/dev/null 2>&1; then
  cloud-init status --wait || true
fi
cd /opt/hr-portal

[ -d test_db ] || git clone https://github.com/datacharmer/test_db.git
cd test_db

mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" --ssl-mode=REQUIRED -e "CREATE DATABASE IF NOT EXISTS employees CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

CNT=$(mysql -N -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" --ssl-mode=REQUIRED -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='employees' AND table_name='departments';")
if [ "$CNT" -gt 0 ]; then
  echo "employees already loaded"
else
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" --ssl-mode=REQUIRED --force employees < employees.sql
fi
