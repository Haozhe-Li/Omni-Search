from flask import Flask, render_template, request, jsonify
from core.aisearch import AISearch
from core.test_response import get_sample_response
import time

app = Flask(__name__)


@app.route("/")
async def index():
    return render_template("index.html")


@app.route("/search", methods=["POST"])
async def search():
    query = request.json["query"]
    mode = request.json["mode"]
    if query == "test":
        result = get_sample_response()
        time.sleep(3)
        return jsonify({"result": result})
    search = AISearch()
    result = await search.search(query) if mode == "universal" else await search.quick_search(query)
    result = result["answer"]
    return jsonify({"result": result})


if __name__ == "__main__":
    app.run(debug=True)
