#!/bin/sh

. config/server.sh

# if server already running, print out pid and quit
if [ -f $PID_FILE ]
then
	pid=`cat $PID_FILE`
	echo "Server already running with pid $pid."
	exit
fi

if ! [ -f $OUT_FILE ]
then
	touch $OUT_FILE
fi

if ! [ -f $ERR_FILE ]
then
	touch $ERR_FILE
fi

# start the node server
nohup $NODE $ROOT_DIR/server.js < /dev/null > $OUT_FILE 2> $ERR_FILE &
pid=$!
echo "Server running with pid $pid."

# save pid to a file so we can stop the server later
echo $pid > $PID_FILE
echo "Pid saved in file $PID_FILE."

echo