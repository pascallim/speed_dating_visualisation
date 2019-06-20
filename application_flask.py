#!/usr/bin/python3
# -*- coding: utf-8 -*-

from flask import Flask, render_template, session, request, redirect, flash, url_for

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('home.html')

@app.route('/redirect_to_graph', methods=['POST'])
def redirect_to_graph():
    return redirect(url_for('graph'))

@app.route('/graph', methods=['GET'])
def graph():
    return render_template('graph.html')


if __name__ == '__main__':
    app.run(port= 7000, debug=True)
