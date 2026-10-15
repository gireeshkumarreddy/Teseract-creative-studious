"""Static server for verification: threaded, large listen backlog (Windows refuses
connections beyond the default backlog of 5). Usage: python -I hero-serve.py PORT DIR"""
import functools, http.server, sys

class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

port, root = int(sys.argv[1]), sys.argv[2]
Server(('127.0.0.1', port), functools.partial(Quiet, directory=root)).serve_forever()
