import cgi, cgitb, json, base64
cgitb.enable()


def Main():
    
    try:

        data = cgi.FieldStorage()
        keys = data.keys()

        if (len(keys) > 0):

            glob = data['glob'].value

            if str(glob) != 'glob':

                doStuff(glob)


            return

        
    except Exception as e:
        
        print 'HTTP/1.0 200 OK'
        print 'Content-Type: application/json'
        print ''
        print '{status:"error"}' + e.message
        
        
    return


# Handle data
def doStuff(glob):

    try:

        # Decode Base64 and grab JSON variables
        jsonData = json.loads(base64.b64decode(glob))

        mod = jsonData['mod']
        video = jsonData['video']
        thing = jsonData['thing']
        author = jsonData['author']
        bl_wl = jsonData['bl_wl']
        subs = jsonData['subs'].split(',')

        # Do validation and DB Calls
        
        print 'HTTP/1.0 200 OK'
        print 'Content-Type: application/json'
        print ''
        print '{status:"success"}'

    except Exception as e:
        
        print 'HTTP/1.0 200 OK'
        print 'Content-Type: application/json'
        print ''
        print '{status:"error processing"}' + e.message


    return



Main()
