<?php defined( 'ABSPATH' ) or exit; ?>

<div id="su_admin_addons" class="su-admin-addons wp-clearfix">
	<?php foreach( $this->get_plugin_addons() as $addon ) : ?>
		<a href="<?php echo esc_attr( $addon['url'] ); ?>" class="su-admin-addons-item" target="_blank">
			<img src="<?php echo $this->get_plugin_url(); ?>admin/images/addons/<?php echo esc_attr( $addon['id'] ); ?>.png" class="su-admin-addons-item-image">
			<span class="su-admin-addons-item-info">
				<span class="su-admin-addons-item-title"><?php echo $addon['title']; ?></span>
				<span class="su-admin-addons-item-description"><?php echo $addon['description'] ?></span>
				<span class="su-admin-addons-item-button button"><?php _e( 'Learn more', 'shortcodes-ultimate' ); ?></span>
			</span>
		</a>
	<?php endforeach; ?>
</div>
