from flask import Flask, render_template, request, jsonify
from core.aisearch import AISearch
from core.test_response import get_sample_response
from core.suggestion import get_suggestion
import time
import os

is_dev = os.environ.get("DEV", 0)

app = Flask(__name__)
search = AISearch()


@app.route("/")
async def index():
    return render_template("index.html")

@app.route("/getsuggestion")
async def getsuggestion():
    language = request.args.get("language")
    return jsonify(get_suggestion(language))


@app.route("/search", methods=["POST"])
async def main():
    query = request.json["query"]
    mode = request.json["mode"]
    if query == "test":
        result = get_sample_response()
        time.sleep(3)
        return jsonify({"result": result})
    if query == "longtest":
        result = get_sample_response()
        time.sleep(10)
        return jsonify({"result": result})
    result = (
        await search.search(query)
        if mode == "universal"
        else await search.quick_search(query)
    )
    result = result["answer"]
    return jsonify({"result": result})


if __name__ == "__main__":
    if is_dev:
        app.run(debug=True)
    else:
        app.run()
