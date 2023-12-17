from flask import Flask, jsonify, request
from redis import Redis
from rq import Queue
import model
import db

app = Flask(__name__)

redis_connection = Redis()
q = Queue(connection=redis_connection)


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()
    model_name = data.get("modelName")
    sequence = data.get("sequence")
    sequence_id = data.get("sequenceId")

    if sequence is None:
        return jsonify({
            "error": "No sequence provided",
        }), 400

    job = q.enqueue(
        model.get_model(model_name),
        sequence,
        on_success=model.predict_success_cb,
        on_failure=model.predict_fail_cb
    )

    db.insert_job(job.id, sequence_id)

    return jsonify({
        "jobId": job.id,
    }), 202


if __name__ == "__main__":
    app.run(debug=True)
