import numpy as np
import db
from ml_models.DSSP.predict import AS_DSSP, DS_DSSP

np.set_printoptions(threshold=np.inf)


def get_model(model_name):
    match model_name:
        case "AS_DSSP":
            return AS_DSSP
        case "DS_DSSP":
            return DS_DSSP
        case _:
            raise Exception("Invalid model")


def predict_success_cb(job, connection, result, *args, **kwargs):
    str_result = np.array2string(
        result,
        separator=',',
        formatter={'float_kind': lambda x: "%.5f" % x}
    )
    db.update_success_job(job.id, str_result)


def predict_fail_cb(job, connection, type, value, traceback):
    db.update_fail_job(job.id)


