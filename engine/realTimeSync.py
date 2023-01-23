from datetime import datetime
import json
import sys

sys.path.append("zk")
from zk import ZK


class BasicException(Exception):
    pass


conn = None

deviceIP = sys.argv[1]

zk = ZK(deviceIP, port=4370, timeout=20, password="0", force_udp="-l", verbose=0)
try:
    conn = zk.connect()
    conn.set_sdk_build_1()
    print("deviceName:" + conn.get_device_name() + "")
    sys.stdout.flush()
    counter = 0
    for att in conn.live_capture(10):  # using a generator!
        if att is None:
            counter += 1
            conn.set_sdk_build_1()
            sys.stdout.flush()
        else:
            users = conn.get_users()
            my_atd = []
            currentUser = list(filter(lambda x: x.uid == att.uid, users))
            datal = {}
            datal.__setitem__('id', att.user_id)
            datal.__setitem__('adt', datetime.strftime(att.timestamp, '%Y-%m-%d %H:%M:%S'))
            datal.__setitem__('status', att.status)
            datal.__setitem__('punch', att.punch)
            datal.__setitem__('deviceInfo', conn.get_serialnumber())
            my_atd.append(datal)
            my_json_string = json.dumps(my_atd)
            print(my_json_string)
            sys.stdout.flush()
        if counter >= 10:
            conn.end_live_capture = False
except Exception as e:
    print(e)
    sys.stdout.flush()
