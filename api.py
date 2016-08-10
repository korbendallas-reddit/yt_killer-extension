import cgi, cgitb
cgitb.enable()


def Main():
    
    try:

        data = cgi.FieldStorage()
        keys = data.keys()

        if (len(keys) > 0):

            mod = data['mod'].value
            video = data['video'].value
            thing = data['thing'].value
            author = data['auth'].value
            bl_wl = data['bl_wl'].value
            subs = data['subs'].value

            if mod != 'mod' and video != 'video' and thing != 'thing' and author != 'author' and bl_wl != 'bl_wl' and subs != 'subs':

                doStuff(mod, video, thing, author, bl_wl, subs)


            return

        
    except Exception as e:
        
        print 'HTTP/1.0 200 OK'
        print 'Content-Type: application/json'
        print ''
        print '{status:"error"}'
        
        
    return


# Handle data
def doStuff(mod, video, thing, author, bl_wl, subs):

    try:

        # Validate data & make DB calls
        
        print 'HTTP/1.0 200 OK'
        print 'Content-Type: application/json'
        print ''
        print '{status:"success"}'

    except Exception as e:
        
        print 'HTTP/1.0 200 OK'
        print 'Content-Type: application/json'
        print ''
        print '{status:"error"}'


    return



Main()
