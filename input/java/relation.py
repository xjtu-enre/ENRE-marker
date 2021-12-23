import understand
import argparse
import json
import sys
import re

# Usage
parser = argparse.ArgumentParser()
parser.add_argument('db', help='Specify Understand database')
parser.add_argument('out', help='specify output file\'s name and location')
args = parser.parse_args()


if __name__ == '__main__':
    print('Openning udb file...')
    db = understand.open(args.db)

    rel_list = []

    print('Exporting relations...')
    rel_count = 0
    for ent in db.ents():
        if ent.language() == 'Java':
            for ref in ent.refs():
                if ref.isforward():
                    rel_list.append({
                        'from': ref.scope().id(),
                        'to': ref.ent().id(),
                        'type': ref.kindname(),
                        'line': ref.line(),
                        'column': ref.column()
                    })
                    rel_count += 1

    all_rel_kinds = set()
    for rel in rel_list:
        all_rel_kinds.add(rel['type'])

    # TODO: Post-process

    print('Saving results to the file...')
    with open(args.out, 'w') as out:
        json.dump(rel_list, out, indent=4)
    print(f'Total {rel_count} relations are successfully exported')
    print('All possible relation types are', sorted(all_rel_kinds))
