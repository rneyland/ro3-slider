import os
import shutil

curr_dir = os.getcwd()
dest_dir = curr_dir + '/js/src'
out_file = open(os.path.join(curr_dir, 'js/ro3.js'), 'w')


for root,dirs,files in os.walk(dest_dir):
	files.sort(key=len)
	
	for f in files:
		in_file = open(dest_dir+'/'+f, 'r')
		raw = str(in_file.read())
		out_file.write(raw)
		in_file.close()

out_file.close()

