import os
import sys
import numpy as np
from keras.models import model_from_json

BASE_KEY = {'A': 0, 'C': 1, 'G': 2, 'T': 3, 'N': 4}

def build_seq_vec(seq, window):
    half_window = (window // 2) - 1 
    padded_seq = 'N'*half_window + seq + 'N'*half_window
    input_vec = np.zeros((len(seq), window, 5))
    input_index = 0
    for i in range(half_window, len(padded_seq)-half_window-1):
        seq_window = padded_seq[i-half_window:i+half_window+2]
        for j in range(len(seq_window)):
            input_vec[input_index][j][BASE_KEY[seq_window[j]]] = 1
        input_index += 1
    return input_vec


def AS_DSSP(input_seq):
    input_vec = build_seq_vec(input_seq, 140) 
    model = model_from_json(open(os.path.join(os.path.dirname(__file__), 'AS_model.json')).read())
    model.load_weights(os.path.join(os.path.dirname(__file__), 'AS_model.hdf5'))
    predict = model.predict(input_vec, batch_size=1, verbose=0)
    return predict[:, 0]


def DS_DSSP(input_seq):
    input_vec = build_seq_vec(input_seq, 140) 
    model = model_from_json(open(os.path.join(os.path.dirname(__file__), 'DS_model.json')).read())
    model.load_weights(os.path.join(os.path.dirname(__file__), 'DS_model.hdf5'))
    predict = model.predict(input_vec, batch_size=1, verbose=0)
    return predict[:, 0]

#if sys.argv[1] == 'as':
#    np.savetxt(sys.stdout, AS_DSSP(sys.argv[2]), delimiter=',', fmt='%.4f')
#if sys.argv[1] == 'ds':
#    np.savetxt(sys.stdout, DS_DSSP(sys.argv[2]), delimiter=',', fmt='%.4f')
#

