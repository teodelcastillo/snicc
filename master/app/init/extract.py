"""TESTING ONLY"""
import tabula
import pandas as pd

def write_csv():
    dfs = tabula.read_pdf('pnaymcc_2022_-_vf_resol.pdf', pages=list(range(428,1293)),pandas_options=dict(header=None), lattice=True)
    df = pd.concat(dfs, ignore_index=True)[[0,1]]
    # remove these ugly \r
    df[0] = df[0].str.replace('\r', ' ')
    df[1] = df[1].str.replace('\r', '\\n')

    return df
    df.to_csv('../app/test.csv')


