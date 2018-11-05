(function() {

	const { Fragment }      = wp.element;
	const { BlockControls } = wp.editor;
	const { SVG, Path }     = wp.components;

	const withInsertShortcodeButton = BlockEdit => {

		return ( props ) => {

			if ( SUBlockEditorSettings.supportedBlocks.indexOf( props.name ) === -1 ) {
				return <BlockEdit { ...props } />;
			}

			return (
				<Fragment>
					<BlockEdit { ...props } />
					<BlockControls controls={ [
						{
							icon: <SVG viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><Path d="m3 3h5.833v2.333h-3.5v9.334h3.5v2.333h-5.833zm8.167 0h5.833v14h-5.833v-2.333h3.5v-9.334h-3.5z" /></SVG>,
							title: SUBlockEditorL10n.insertShortcode,
							onClick: () => {
								SUG.App.insert( 'block', { props: props } );
							},
						},
					] } />
				</Fragment>
			);

		};

	};

	wp.hooks.addFilter(
		'editor.BlockEdit',
		'shortcodes-ultimate/with-insert-shortcode-button',
		withInsertShortcodeButton
	);

})();
