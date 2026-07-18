from pathlib import Path

import vtracer

# Asset build dependency: vtracer 0.6.12.

SOURCE_ROOT = Path('/tmp/pm-lab-lockups')
OUTPUT_ROOT = Path(__file__).resolve().parent.parent / 'public' / 'lab'


def vectorize(name: str) -> None:
    if name == 'product-lab-wordmark':
        vtracer.convert_image_to_svg_py(
            str(SOURCE_ROOT / f'{name}.png'),
            str(OUTPUT_ROOT / f'{name}.svg'),
            colormode='binary',
            hierarchical='stacked',
            mode='spline',
            filter_speckle=2,
            corner_threshold=60,
            length_threshold=2.0,
            max_iterations=10,
            splice_threshold=45,
            path_precision=3,
        )
        return

    vtracer.convert_image_to_svg_py(
        str(SOURCE_ROOT / f'{name}.png'),
        str(OUTPUT_ROOT / f'{name}.svg'),
        colormode='color',
        hierarchical='stacked',
        mode='spline',
        filter_speckle=4,
        color_precision=8,
        layer_difference=12,
        corner_threshold=60,
        length_threshold=3.5,
        max_iterations=10,
        splice_threshold=45,
        path_precision=3,
    )


OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
vectorize('pick-field-test-logo')
vectorize('product-lab-wordmark')
