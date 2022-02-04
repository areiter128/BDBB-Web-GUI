# -*- coding: utf-8 -*-
"""
Created on Tue Nov  2 10:42:20 2021

@author: Yuanzhe
"""


import http.server
import socketserver

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()