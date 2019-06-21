#!/usr/bin/python3
# -*- coding: utf-8 -*-

from flask import Flask, render_template, session, request, redirect, flash, url_for, Response
import json
import os

# data_sankey = json.loads(open('static/data/data_sankey.json')).read()

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('home.html')

@app.route('/redirect_to_graph', methods=['POST'])
def redirect_to_graph():
    return redirect(url_for('graph'))

@app.route('/graph', methods=['GET'])
def graph():
    return render_template('index.html')

@app.route('/getJson')
def getJson():
    with open('static/data/data_sankey.json') as f:
        data_sankey = json.loads(f.read())
    print(data_sankey)
    response = Response(response=data_sankey, status=200, mimetype="application/json")
    return response

if __name__ == '__main__':
    app.run(port= 7000, debug=True)
