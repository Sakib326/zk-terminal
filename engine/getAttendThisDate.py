import json
import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime

sys.path.append("zk")
from zk import ZK

jsonobj = {"id": '', "time":''}

deviceIP = sys.argv[1]
fDate = sys.argv[2]
tDate = sys.argv[3]

class BasicException(Exception):
    pass

conn = None



zk = ZK(deviceIP, port=4370, timeout=20, password="0", force_udp="-l", verbose=0)
try:
    conn = zk.connect()
    conn.set_sdk_build_1()
    sys.stdout.flush()
    atdData=conn.get_attendance()
    data= list(filter(lambda x: (datetime.strftime(x.timestamp,'%Y-%m-%d') >= str(fDate) and datetime.strftime(x.timestamp,'%Y-%m-%d') <= str(tDate)), atdData))
    my_atd = []
    for att in data:
         datal = {}
         datal.__setitem__('id',att.user_id)
         datal.__setitem__('adt',datetime.strftime(att.timestamp,'%Y-%m-%d %H:%M:%S'))
         datal.__setitem__('status',att.status)
         datal.__setitem__('punch', att.punch)
         datal.__setitem__('deviceInfo', conn.get_serialnumber())
         my_atd.append(datal)
    my_json_string = json.dumps(my_atd)
    print(my_json_string)

except Exception as e:
    print(e)
    sys.stdout.flush()