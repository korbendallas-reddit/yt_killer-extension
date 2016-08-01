import cgi, cgitb
cgitb.enable()


def Main():
    
    try:

        data = cgi.FieldStorage()
        keys = data.keys()

        if (len(keys) > 0):
            
            user = str(data['user'].value)
            subs = str(data['subs'].value)
            state = str(data['state'].value)
            thing = str(data['thing'].value)

            if user != 'user' and subs != 'subs' and state != 'state' and thing != 'thing':

                doStuff(user, subs, state, thing)


            return

        
    except Exception as e:
        
        print('HTTP/1.0 200 OK\n\n')
        print('Content-Type: application/javascript')
        print()
        print('Error processing your request.')
        
        
    return


# Handle data
def doStuff(user, subs, state, thing):

    try:

        # Validate data & make DB calls
        
        print('HTTP/1.0 200 OK\n\n')
        print('Content-Type: application/javascript')
        print()
        print('Yay! Something happened!')

    except Exception as e:
        
        print('HTTP/1.0 200 OK\n\n')
        print('Content-Type: application/javascript')
        print()
        print('Error processing your request.')

    return





Main()
