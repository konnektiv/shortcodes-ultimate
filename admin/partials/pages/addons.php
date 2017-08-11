<?php defined( 'ABSPATH' ) or exit; ?>

<div class="wrap wp-clearfix">
	<h1><?php $this->the_page_title(); ?></h1>
	<?php $this->the_template( 'tabs' ); ?>
	<?php $this->the_template( 'pages/' . $this->get_current_tab() ); ?>
</div>
