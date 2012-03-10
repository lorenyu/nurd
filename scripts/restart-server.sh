#!/bin/sh

. config/server.sh

if [ -f $PID_FILE ]
then
	./scripts/stop-server.sh
fi

./scripts/start-server.sh
