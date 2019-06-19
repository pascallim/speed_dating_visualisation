#!/usr/bin/python3
# -*- coding: utf-8 -*-

from flask import Flask, render_template, session, request, redirect, flash, url_for

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('home.html')

if __name__ == '__main__':
    app.run(port= 7000, debug=True)
