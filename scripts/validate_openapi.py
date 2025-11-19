import os
import sys
import yaml

from openapi_spec_validator import validate_spec


def main():
    base = os.getcwd()
    candidates = [
        os.path.join(base, 'openapi', 'mindgarden.yaml'),
        os.path.join(base, '..', 'openapi', 'mindgarden.yaml'),
        os.path.join('C:\\', 'openapi', 'mindgarden.yaml'),
        '/openapi/mindgarden.yaml'
    ]
    path = None
    for p in candidates:
        if os.path.exists(p):
            path = p
            break
    if path is None:
        print('ERROR: OpenAPI file not found. Tried:')
        for p in candidates:
            print(' - ' + p)
        sys.exit(2)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            spec = yaml.safe_load(f)
    except Exception as e:
        print('ERROR: Failed to load YAML:')
        print(e)
        sys.exit(2)

    try:
        validate_spec(spec)
        print('OpenAPI validation: SUCCESS')
        sys.exit(0)
    except Exception as e:
        print('OpenAPI validation: FAILED')
        print(e)
        sys.exit(3)


if __name__ == '__main__':
    main()
