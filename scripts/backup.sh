#!/usr/bin/env bash

BASEDIR=$(cd "$(dirname "$0")" && pwd)
ENV_FILE="$BASEDIR/../.env"

if ! [[ -f $ENV_FILE ]]; then
  echo "There is no $ENV_FILE file"
else
  source $ENV_FILE
fi

backup_db() {
  local current_datetime=$(date +"%d-%m-%Y_%H-%M-%S")

  mysqldump $DB_NAME --no-create-info --complete-insert -u vera -p$DB_PASSWORD > "$BASEDIR/../backups/backup_$current_datetime.sql"
}

backup_db
