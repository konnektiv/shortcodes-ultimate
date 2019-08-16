<?php

su_add_shortcode(
	array(
		'id'       => 'image_carousel',
		'callback' => 'su_shortcode_image_carousel',
		'image'    => su_get_plugin_url() . 'admin/images/shortcodes/image_carousel.svg',
		'name'     => __( 'Image carousel', 'shortcodes-ultimate' ),
		'desc'     => __( 'Customizable image gallery (slider and carousel)', 'shortcodes-ultimate' ),
		'type'     => 'single',
		'group'    => 'gallery',
		'icon'     => 'picture-o',
		'atts'     => array(

			// TODO: define shortcode atts [!!!]
			'source'     => array(
				'default' => 'none',
			),
			'limit'      => array(
				'default' => 20,
			),
			'style'      => array(
				'default' => 'default',
			),
			'crop'       => array(
				'default' => '4-3',
			),
			'columns'    => array(
				'default' => '1',
			),
			'adaptive'   => array(
				'default' => 'yes',
			),
			'spacing'    => array(
				'default' => 'yes',
			),
			'width'      => array(
				'default' => 'none',
			),
			'align'      => array(
				'default' => 'none',
			),
			'captions'   => array(
				'default' => 'no',
			),
			'arrows'     => array(
				'default' => 'yes',
			),
			'dots'       => array(
				'default' => 'yes',
			),
			'link'       => array(
				'default' => 'image',
			),
			'target'     => array(
				'default' => 'blank',
			),
			'autoplay'   => array(
				'default' => '5',
			),
			'speed'      => array(
				'default' => '0.28',
			),
			'image_size' => array(
				'default' => 'large',
			),

			'class'      => array(
				'default' => '',
			),
		),
	)
);

function su_shortcode_image_carousel( $atts = null, $content = null ) {

	$atts = su_parse_shortcode_atts( $atts, 'image_carousel' );

	// TODO: remove [!]
	$atts['source'] = 'media:recent';

	$atts['columns']    = intval( $atts['columns'] );
	$atts['style']      = sanitize_key( $atts['style'] );
	$atts['image_size'] = sanitize_key( $atts['image_size'] );
	$atts['crop']       = sanitize_key( $atts['crop'] );

	$items  = array();
	$slides = su_get_gallery_slides(
		$atts['source'],
		array(
			'limit' => $atts['limit'],
			'link'  => $atts['link'],
		)
	);

	if ( ! $slides ) {

		return su_error_message(
			'Image Carousel',
			__( 'images not found', 'shortcodes-ultimate' )
		);

	}

	$link_target_attr = 'blank' === $atts['target']
		? ' target="_blank" rel="noopener noreferrer"' :
		'';

	foreach ( $slides as $slide ) {

		$content = wp_get_attachment_image(
			$slide['attachment_id'],
			$atts['image_size'],
			false,
			array( 'class' => '' )
		);

		if ( 'yes' === $atts['captions'] ) {

			$content = sprintf(
				'%s<span>%s</span>',
				$content,
				$slide['caption']
			);

		}

		if ( 'none' !== $atts['link'] ) {

			$content = sprintf(
				'<a href="%s"%s>%s</a>',
				esc_attr( esc_url_raw( $slide['link'] ) ),
				$link_target_attr,
				$content
			);

		}

		$items[] = sprintf(
			'<div class="su-image-carousel-item"><div class="su-image-carousel-item-content">%s</div></div>',
			$content
		);

	}

	if ( $atts['columns'] > 1 ) {
		$atts['class'] .= ' su-image-carousel-columns-' . $atts['columns'];
	}

	if ( 'yes' === $atts['spacing'] ) {
		$atts['class'] .= ' su-image-carousel-has-spacing';
	}

	if ( 'no' !== $atts['crop'] ) {
		$atts['class'] .= ' su-image-carousel-crop su-image-carousel-crop-' . $atts['crop'];
	}

	$atts['class'] .= ' su-image-carousel-style-' . $atts['style'];

	$flickity = array(
		'groupCells'     => true,
		'cellSelector'   => '.su-image-carousel-item',
		'adaptiveHeight' => 'no' === $atts['crop'],
		'cellAlign'      => 'left',
		// Disable 'contain' if images are not equal by height
		// @see: https://github.com/metafizzy/flickity/issues/554
		'contain'        => 'no' !== $atts['crop'],
	);

	$flickity = apply_filters( 'su/shortcode/image_carousel/flickity', $flickity, $atts );

	su_query_asset( 'js', 'flickity' );
	su_query_asset( 'css', 'flickity' );
	su_query_asset( 'css', 'su-shortcodes' );

	return sprintf(
		'<div class="su-image-carousel %1$s" data-flickity=\'%2$s\'>%3$s</div>',
		esc_attr( su_get_css_class( $atts ) ),
		wp_json_encode( $flickity ),
		implode( $items )
	);

}
