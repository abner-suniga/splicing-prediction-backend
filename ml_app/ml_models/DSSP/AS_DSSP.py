# -*- coding: utf-8 -*-

import os
import sys
import argparse
import numpy as np
from keras.models import model_from_json

BASE_KEY = {'A': 0, 'C': 1, 'G': 2, 'T': 3, 'N': 4}


def check_input(input_seq):

    if not type(input_seq) == str:
        print('The input must be a string.')
        sys.exit(1)

    if not len(input_seq) == 140:
        print('The sequence should be 140-mer.')

    if not input_seq[68:70] == 'AG':
        print('The position of 69 and 70 should be "AG".')

def build_seq_vec(seq, window):
    half_window = (window // 2) - 1
    padded_seq = 'N'*half_window + seq + 'N'*half_window
    input_vec = np.zeros((len(seq)-1, window, 5))
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
    return predict
    #np.savetxt(sys.stdout, predict, delimiter=',', fmt='%.4f')


def main(argv=sys.argv):

    parser = argparse.ArgumentParser(description='Receive a single 140-mer base sequence string or FASTA file.')

    if len(argv) == 1:
        parser.parse_args(['-h'])

    parser.add_argument('-I', '--input', required=True, help='140-mer base sequece string, or FASTA file')
    parser.add_argument('-O', '--output', required=False, help='path to the output file')

    args = parser.parse_args()

    if os.path.isfile(args.input):
        input_file = args.input
        if args.output:
            fn_o = args.output
        else:
            fn_o = os.path.splitext(input_file)[0] + '_result.txt'

        f_i = open(input_file, mode='r')
        f_o = open(fn_o, mode='w')
        line = f_i.readline()
        while line:
            if line[0] == '>':
                f_o.write(line)
                input_seq = f_i.readline().rstrip()
                predict = AS_DSSP(input_seq)
                f_o.write(str(predict)+'\n')
            else:
                f_i.close()
                f_o.close()
                sys.exit(1)
            line = f_i.readline()
        f_i.close()
        f_o.close()
    
    else:
        input_seq = args.input       
        predict = AS_DSSP(input_seq)
        if args.output:
            with open(args.output, mode='w') as f_o:
                f_o.write(str(predict))


if __name__ == '__main__':
    main()
