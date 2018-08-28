<?php

class pwdThemeOptions {

    public function pwd_options_pages() {
	
        if( function_exists('acf_add_options_page') ) {
		
            $option_page = acf_add_options_page(array(
                'page_title' 	=> __('Theme Map Settings', 'pwd'),
                'menu_title' 	=> __('Theme Map Settings', 'pwd'),
                'menu_slug' 	=> 'theme-map-settings',
                'capability' 	=> 'edit_posts',
                'parent_slug'   => 'themes.php',
            ));
            $option_page = acf_add_options_page(array(
                'page_title' 	=> __('Google Analytics Settings', 'pwd'),
                'menu_title' 	=> __('Google Analytics', 'pwd'),
                'menu_slug' 	=> 'theme-ga-settings',
                'capability' 	=> 'edit_posts',
                'parent_slug'   => 'options-general.php',
            ));
            
        }
        
    }

    public function pwd_map_api() {
        $api = get_field( 'google_maps_api', 'option' );
        acf_update_setting( 'google_api_key', $api );
    }


    public function pwd_google_analytics() {
        if( function_exists('acf_add_local_field_group') ):

            acf_add_local_field_group(array(
                'key' => 'group_5b0b7a4632365',
                'title' => 'Google Analytics',
                'fields' => array(
                    array(
                        'key' => 'field_5b0b7a55b1005',
                        'label' => 'Head Code',
                        'name' => 'pwd_head_code',
                        'type' => 'textarea',
                        'instructions' => '',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'placeholder' => '',
                        'maxlength' => '',
                        'rows' => '',
                        'new_lines' => '',
                    ),
                    array(
                        'key' => 'field_5b0b7a69b1006',
                        'label' => 'Body Code',
                        'name' => 'pwd_body_code',
                        'type' => 'textarea',
                        'instructions' => '',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'placeholder' => '',
                        'maxlength' => '',
                        'rows' => '',
                        'new_lines' => '',
                    ),
                    array(
                        'key' => 'field_5b0b7a77b1007',
                        'label' => 'Footer Code',
                        'name' => 'pwd_footer_code',
                        'type' => 'textarea',
                        'instructions' => '',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'placeholder' => '',
                        'maxlength' => '',
                        'rows' => '',
                        'new_lines' => '',
                    ),
                ),
                'location' => array(
                    array(
                        array(
                            'param' => 'options_page',
                            'operator' => '==',
                            'value' => 'theme-ga-settings',
                        ),
                    ),
                ),
                'menu_order' => 0,
                'position' => 'normal',
                'style' => 'seamless',
                'label_placement' => 'top',
                'instruction_placement' => 'label',
                'hide_on_screen' => '',
                'active' => 1,
                'description' => '',
            ));
            
            endif;
        }

        public function pwd_google_map_fields() {
            if( function_exists('acf_add_local_field_group') ):

            acf_add_local_field_group(array(
                'key' => 'group_5adf2f3b798ba',
                'title' => 'Theme Map Settings',
                'fields' => array(
                    array(
                        'key' => 'field_5ae7dc9928e32',
                        'label' => 'Google Maps',
                        'name' => '',
                        'type' => 'tab',
                        'instructions' => '',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'placement' => 'top',
                        'endpoint' => 0,
                    ),
                    array(
                        'key' => 'field_5ae7dca928e33',
                        'label' => 'API',
                        'name' => 'google_maps_api',
                        'type' => 'text',
                        'instructions' => 'get free key here: <a href="https://developers.google.com/maps/documentation/javascript/get-api-key">https://developers.google.com/maps/documentation/javascript/get-api-key</a>',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'placeholder' => '',
                        'prepend' => '',
                        'append' => '',
                        'maxlength' => '',
                    ),
                    array(
                        'key' => 'field_5ae7f2a07fab0',
                        'label' => 'Zoom Level',
                        'name' => 'google_maps_zoom_level',
                        'type' => 'range',
                        'instructions' => '',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => 14,
                        'min' => '',
                        'max' => 19,
                        'step' => '',
                        'prepend' => '',
                        'append' => '',
                    ),
                    array(
                        'key' => 'field_5ae7f2c67fab1',
                        'label' => 'Map Marker SVG',
                        'name' => 'google_map_marker_svg',
                        'type' => 'textarea',
                        'instructions' => 'Upload the path code only',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => 'M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z',
                        'placeholder' => 'M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z',
                        'maxlength' => '',
                        'rows' => 3,
                        'new_lines' => '',
                    ),
                    array(
                        'key' => 'field_5ae7f3067fab2',
                        'label' => 'Marker Fill Colour',
                        'name' => 'google_map_marker_fill_colour',
                        'type' => 'color_picker',
                        'instructions' => '',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '#b20022',
                    ),
                    array(
                        'key' => 'field_5ae7f3337fab3',
                        'label' => 'Map Marker Scale',
                        'name' => 'google_map_marker_scale',
                        'type' => 'range',
                        'instructions' => '',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'min' => '',
                        'max' => 5,
                        'step' => '0.5',
                        'prepend' => '',
                        'append' => '',
                    ),
                    array(
                        'key' => 'field_5ae7f3877fab4',
                        'label' => 'Snazzy Maps Style',
                        'name' => 'snazzy_maps_style',
                        'type' => 'textarea',
                        'instructions' => 'get styles here: <a href="https://snazzymaps.com/">https://snazzymaps.com</a>',
                        'required' => 0,
                        'conditional_logic' => 0,
                        'wrapper' => array(
                            'width' => '',
                            'class' => '',
                            'id' => '',
                        ),
                        'default_value' => '',
                        'placeholder' => '',
                        'maxlength' => '',
                        'rows' => '',
                        'new_lines' => '',
                    ),
                ),
                'location' => array(
                    array(
                        array(
                            'param' => 'options_page',
                            'operator' => '==',
                            'value' => 'theme-map-settings',
                        ),
                    ),
                ),
                'menu_order' => 0,
                'position' => 'normal',
                'style' => 'seamless',
                'label_placement' => 'top',
                'instruction_placement' => 'label',
                'hide_on_screen' => '',
                'active' => 1,
                'description' => '',
            ));
            
            endif;
        }
}

class themeCustomizer {

    public function customizer_settings( $wp_customize ) {
        $wp_customize->add_setting( 'phone_number', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'phone_number', array(
            'type' => 'text',
            'section' => 'title_tagline',
            'label' => __( 'Phone Number', 'digimon' ),
        ) );
        
        $wp_customize->add_setting( 'fax_number', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'fax_number', array(
            'type' => 'text',
            'section' => 'title_tagline',
            'label' => __( 'Fax Number', 'digimon' ),
        ) );
        
        $wp_customize->add_setting( 'email_address', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'email_address', array(
            'type' => 'text',
            'section' => 'title_tagline',
            'label' => __( 'Email Address', 'digimon' ),
        ) );
        
        $wp_customize->add_setting( 'facebook', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'facebook', array(
            'type' => 'text',
            'section' => 'title_tagline',
            'label' => __( 'Facebook URL', 'digimon' ),
        ) );

        $wp_customize->add_setting( 'instagram', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'instagram', array(
            'type' => 'text',
            'section' => 'title_tagline',
            'label' => __( 'Instagram URL', 'digimon' ),
        ) );

        /**
         * Social Profiles
         */
        $wp_customize->add_section( 'social_profiles' , array(
            'title'      => __( 'Social Profiles', 'digimon' ),
            'priority'   => 30,
        ) );

        $wp_customize->add_setting( 'facebook', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'facebook', array(
            'type' => 'text',
            'section' => 'social_profiles',
            'label' => __( 'Facebook URL', 'digimon' ),
        ) );

        $wp_customize->add_setting( 'twitter', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'twitter', array(
            'type' => 'text',
            'section' => 'social_profiles',
            'label' => __( 'Twitter URL', 'digimon' ),
        ) );

        $wp_customize->add_setting( 'instagram', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'instagram', array(
            'type' => 'text',
            'section' => 'social_profiles',
            'label' => __( 'Instagram URL', 'digimon' ),
        ) );

        $wp_customize->add_setting( 'youtube', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'youtube', array(
            'type' => 'text',
            'section' => 'social_profiles',
            'label' => __( 'YouTube URL', 'digimon' ),
        ) );

        $wp_customize->add_setting( 'linkedin', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'linkedin', array(
            'type' => 'text',
            'section' => 'social_profiles',
            'label' => __( 'LinkedIn URL', 'digimon' ),
        ) );

        $wp_customize->add_setting( 'pinterest', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'pinterest', array(
            'type' => 'text',
            'section' => 'social_profiles',
            'label' => __( 'Pinterest URL', 'digimon' ),
        ) );

        $wp_customize->add_setting( 'google', array(
            'capability' => 'edit_theme_options',
            'sanitize_callback' => 'sanitize_text_field',
        ) );
          
        $wp_customize->add_control( 'google', array(
            'type' => 'text',
            'section' => 'social_profiles',
            'label' => __( 'Google+ URL', 'digimon' ),
        ) );

    }
    
}