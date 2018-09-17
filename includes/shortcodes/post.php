<?php

su_add_shortcode( array(
		'id' => 'post',
		'callback' => 'su_shortcode_post',
		'image' => su_get_plugin_url() . 'admin/images/shortcodes/post.svg',
		'name' => __( 'Post data', 'shortcodes-ultimate' ),
		'type' => 'single',
		'group' => 'data',
		'atts' => array(
			'field' => array(
				'type' => 'select',
				'values' => array(
					'ID'                    => __( 'Post ID', 'shortcodes-ultimate' ),
					'post_author'           => __( 'Post author', 'shortcodes-ultimate' ),
					'post_date'             => __( 'Post date', 'shortcodes-ultimate' ),
					'post_date_gmt'         => __( 'Post date', 'shortcodes-ultimate' ) . ' GMT',
					'post_content'          => __( 'Post content', 'shortcodes-ultimate' ),
					'post_title'            => __( 'Post title', 'shortcodes-ultimate' ),
					'post_excerpt'          => __( 'Post excerpt', 'shortcodes-ultimate' ),
					'post_status'           => __( 'Post status', 'shortcodes-ultimate' ),
					'comment_status'        => __( 'Comment status', 'shortcodes-ultimate' ),
					'ping_status'           => __( 'Ping status', 'shortcodes-ultimate' ),
					'post_name'             => __( 'Post name', 'shortcodes-ultimate' ),
					'post_modified'         => __( 'Post modified', 'shortcodes-ultimate' ),
					'post_modified_gmt'     => __( 'Post modified', 'shortcodes-ultimate' ) . ' GMT',
					'post_content_filtered' => __( 'Filtered post content', 'shortcodes-ultimate' ),
					'post_parent'           => __( 'Post parent', 'shortcodes-ultimate' ),
					'guid'                  => __( 'GUID', 'shortcodes-ultimate' ),
					'menu_order'            => __( 'Menu order', 'shortcodes-ultimate' ),
					'post_type'             => __( 'Post type', 'shortcodes-ultimate' ),
					'post_mime_type'        => __( 'Post mime type', 'shortcodes-ultimate' ),
					'comment_count'         => __( 'Comment count', 'shortcodes-ultimate' )
				),
				'default' => 'post_title',
				'name' => __( 'Field', 'shortcodes-ultimate' ),
				'desc' => __( 'Post data field name', 'shortcodes-ultimate' )
			),
			'default' => array(
				'default' => '',
				'name' => __( 'Default', 'shortcodes-ultimate' ),
				'desc' => __( 'This text will be shown if data is not found', 'shortcodes-ultimate' )
			),
			'before' => array(
				'default' => '',
				'name' => __( 'Before', 'shortcodes-ultimate' ),
				'desc' => __( 'This content will be shown before the value', 'shortcodes-ultimate' )
			),
			'after' => array(
				'default' => '',
				'name' => __( 'After', 'shortcodes-ultimate' ),
				'desc' => __( 'This content will be shown after the value', 'shortcodes-ultimate' )
			),
			'post_id' => array(
				'default' => '',
				'name' => __( 'Post ID', 'shortcodes-ultimate' ),
				'desc' => __( 'You can specify custom post ID. Leave this field empty to use an ID of the current post. Current post ID may not work in Live Preview mode', 'shortcodes-ultimate' )
			),
			'filter' => array(
				'default' => '',
				'name' => __( 'Filter', 'shortcodes-ultimate' ),
				'desc' => __( 'You can apply custom filter to the retrieved value. Enter here function name. Your function must accept one argument and return modified value. Name of your function must include word <b>filter</b>. Example function: ', 'shortcodes-ultimate' ) . "<br /><pre><code style='display:block;padding:5px'>function my_custom_filter( \$value ) {\n\treturn 'Value is: ' . \$value;\n}</code></pre>"
			)
		),
		'desc' => __( 'Post data', 'shortcodes-ultimate' ),
		'icon' => 'info-circle',
	) );

function su_shortcode_post( $atts = null, $content = null ) {
	$atts = shortcode_atts( array(
			'field'   => 'post_title',
			'default' => '',
			'before'  => '',
			'after'   => '',
			'post_id' => '',
			'filter'  => ''
		), $atts, 'post' );
	// Define current post ID
	if ( !$atts['post_id'] ) $atts['post_id'] = get_the_ID();
	// Check post ID
	if ( !is_numeric( $atts['post_id'] ) || $atts['post_id'] < 1 ) return sprintf( '<p class="su-error">Post: %s</p>', __( 'post ID is incorrect', 'shortcodes-ultimate' ) );
	// Get the post
	$post = get_post( $atts['post_id'] );
	// Set default value if meta is empty
	$post = ( empty( $post ) || empty( $post->{$atts['field']} ) ) ? $atts['default'] : $post->{$atts['field']};
	// Apply cutom filter
	if (
		$atts['filter'] &&
		su_is_filter_safe( $atts['filter'] ) &&
		function_exists( $atts['filter'] )
	) {
		$post = call_user_func( $atts['filter'], $post );
	}
	// Return result
	return ( $post ) ? $atts['before'] . $post . $atts['after'] : '';
}
