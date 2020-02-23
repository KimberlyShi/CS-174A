window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
    class Assignment_Three_Scene extends Scene_Component {
        constructor(context, control_box)
        {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);

            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                torus: new Torus(15, 15),
                torus2: new (Torus.prototype.make_flat_shaded_version())(15, 15),

                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                //        (Requirement 1)
                sphere: new Subdivision_Sphere(4), //used for sun and planet3
                planet1Shape: new (Subdivision_Sphere.prototype.make_flat_shaded_version()) (2),
                planet2Shape: new Subdivision_Sphere(3),
                // moon: new Subdivision_Sphere(1),
                moon: new (Subdivision_Sphere.prototype.make_flat_shaded_version()) (1),
                gridsphere: new (Grid_Sphere.prototype.make_flat_shaded_version())(10,10)
            };
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.materials =
                {
                    test: context.get_instance(Phong_Shader).material(Color.of(1, 1, 0, 1), {ambient: .2}),
                    ring: context.get_instance(Ring_Shader).material(),

                    // TODO:  Fill in as many additional material objects as needed in this key/value table.
                    //        (Requirement 1)
                    sun: context.get_instance(Phong_Shader).material(Color.of(1,0,0,1),
                        {ambient: 1}),
                    planet1: context.get_instance(Phong_Shader).material(Color.of(0.25, 0.25, 0.35, 1),
                        {ambient: 0}, {diffusivity: 1}, {specularity: 0}, {smoothness: 0} ),
                    // planet2: context.get_instance( Phong_Shader ).material( Color.of(0.5, 0.8, 0.65, 1),
                    //     {ambient: 0}, {diffusivity: .4}),
                    planet2: context.get_instance( Phong_Shader).material(), //will be override
                    planet3: context.get_instance( Phong_Shader ).material( Color.of(0.55, 0.40, 0.15, 1),
                        {ambient: 0}, {diffusivity: 1}, {specularity: 1} ), //max diffusivity and specularity
                    planet4: context.get_instance( Phong_Shader ).material( Color.of(0.3, 0.45, 0.75, 1),
                        {ambient: 0}, {specularity: .9}, {smoothness: 100} ),
                    moon: context.get_instance( Phong_Shader ).material( Color.of( 0.65, 0.85, 0.55, 1),
                        {ambient: 0} ),
                    planet5: context.get_instance( Phong_Shader ).material( Color.of(0.75, 0.75, 0.75, 1))
                };

            // this.lights = [new Light(Vec.of(5, -10, 5, 1), Color.of(0, 1, 1, 1), 1000)];
            this.lights = [ new Light( Vec.of( 0,0,0,0 ), Color.of( 0,0,0,0),0)];
        }

        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("View solar system", ["0"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("Attach to planet 1", ["1"], () => this.attached = () => this.planet_1);
            this.key_triggered_button("Attach to planet 2", ["2"], () => this.attached = () => this.planet_2);
            this.new_line();
            this.key_triggered_button("Attach to planet 3", ["3"], () => this.attached = () => this.planet_3);
            this.key_triggered_button("Attach to planet 4", ["4"], () => this.attached = () => this.planet_4);
            this.new_line();
            this.key_triggered_button("Attach to planet 5", ["5"], () => this.attached = () => this.planet_5);
            this.key_triggered_button("Attach to moon", ["m"], () => this.attached = () => this.moon);
        }

        display(graphics_state) {
            // graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;


            // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)
            // this.shapes.torus2.draw(graphics_state, Mat4.identity(), this.materials.test);

            let radius = 2 + Math.sin(2 * Math.PI/5 * t);
            let color = 0.5 + 0.5 * Math.sin(2 * Math.PI/5 * t);

            //Sun
            let transformSun = Mat4.identity();
            let colorOfSun = Color.of(color, 0, 1-color, 1);
            transformSun = transformSun.times( Mat4.scale([radius, radius, radius]) );
            graphics_state.lights = [ new Light( Vec.of(0, 0, 0, 1), colorOfSun, 10**radius) ];
            this.shapes.sphere.draw( graphics_state, transformSun, this.materials.sun.override( {color: colorOfSun} ));

            //Planet 1: Icy-gray, 2 subdivisions, flat shaded, diffuse only
            let transformPlanet1 = Mat4.identity();
            transformPlanet1 = transformPlanet1.times( Mat4.rotation(t, Vec.of(0,1,0)));
            transformPlanet1 = transformPlanet1.times( Mat4. translation([5,0,0]));
            transformPlanet1 = transformPlanet1.times( Mat4.rotation(t, Vec.of(0,1,0)));
            //attach to key
            this.planet_1 = transformPlanet1;

            this.shapes.planet1Shape.draw(graphics_state, transformPlanet1, this.materials.planet1);
            //Planet 2
            //decrease t by 0.2
            let transformPlanet2 = Mat4.identity();
            transformPlanet2 = transformPlanet2.times(Mat4.rotation(t * 0.8, Vec.of(0,1,0)));
            transformPlanet2 = transformPlanet2.times(Mat4.translation([8,0,0]));
            transformPlanet2 = transformPlanet2.times(Mat4.rotation(t * 0.8, Vec.of(0,1,0)));
            var gouraudColoring;
            //interpolates coloring
            if (Math.floor(t) % 2 == 0) {
                gouraudColoring = 0;
            }
            else {
                gouraudColoring = 1;
            }

            //attached to key
            this.planet_2 = transformPlanet2;

            // this.shapes.planet2Shape.draw(graphics_state, transformPlanet2, this.materials.planet2);
            this.shapes.planet2Shape.draw(graphics_state, transformPlanet2, this.materials.planet2.override(
                {
                    color: Color.of(0.2, 0.8, 0.5, 1), specularity: 1, diffusivity: 0.2,
                    gouraud: gouraudColoring
                }
            ));

            //Planet 3     Saturn
            let transformPlanet3 = Mat4.identity();
            // transformPlanet3 = transformPlanet3.times(Mat4.rotation(t/1.4, Vec.of(0,1,0)));
            // transformPlanet3 = transformPlanet3.times(Mat4.translation([11,0,0]));
            // transformPlanet3 = transformPlanet3.times(Mat4.rotation(t/1.4, Vec.of(1,1,1)));

           transformPlanet3 = transformPlanet3.times( Mat4.translation([11 * Math.sin(.35 * t), 0, 11 * Math.cos(.35 * t)]));
            // transformPlanet3 = transformPlanet3.times( Mat4.rotation( 1, Vec.of(.2,.2,.2)))
            //     .times( Mat4.rotation( .5 * t, Vec.of(Math.sin(.02), Math.cos(.02), 0)));
            transformPlanet3 = transformPlanet3.times( Mat4.rotation( 1, Vec.of(.2,.2,.2)));
            transformPlanet3 = transformPlanet3.times( Mat4.rotation( .5 * t, Vec.of(Math.sin(.02), Math.cos(.02), 0)));
            this.shapes.sphere.draw( graphics_state, transformPlanet3, this.materials.planet3 );
            //attached to key
            this.planet_3 = transformPlanet3;

            transformPlanet3 = transformPlanet3.times( Mat4.scale([1, 1, .001]));
            this.shapes.torus2.draw(graphics_state, transformPlanet3, this.materials.ring);

            //Planet 4
            let transformPlanet4 = Mat4.identity();
            transformPlanet4 = transformPlanet4.times(Mat4.rotation(t/1.67, Vec.of(0,1,0)));
            transformPlanet4 = transformPlanet4.times(Mat4.translation([14,0,0]));
            transformPlanet4 = transformPlanet4.times(Mat4.rotation(t/1.67, Vec.of(0,1,0)));

            this.shapes.sphere. draw(graphics_state, transformPlanet4, this.materials.planet4);
            this.planet_4 = transformPlanet4;

            let moonTransform = transformPlanet4;
            moonTransform = moonTransform.times(Mat4.rotation(t/1.2, Vec.of(0,1,0)));
            moonTransform = moonTransform.times(Mat4.translation([2,0,0]));
            moonTransform = moonTransform.times(Mat4.scale([0.75, 0.75, 0.75]));
            this.shapes.moon.draw(graphics_state, moonTransform, this.materials.moon);
            this.moon = moonTransform;

            //Planet 5
            //half circle closer
            let transformPlanet5 = Mat4.identity();
            transformPlanet5 = transformPlanet5.times(Mat4.rotation(t/1.6, Vec.of(0,1,0)));
            transformPlanet5 = transformPlanet5.times(Mat4.translation([-17,0,0]));
            transformPlanet5 = transformPlanet5.times(Mat4.rotation(t, Vec.of(0,1,0)));
            this.shapes.gridsphere.draw(graphics_state, transformPlanet5, this.materials.planet5);
            this.planet_5 = transformPlanet5;


            if(this.attached != null || this.attached != undefined) {
                let desired = Mat4.inverse(this.attached().times(Mat4.translation([0, 0, 5])));

                //Extra Credit 1
                desired = desired.map((x, i) => Vec.from( graphics_state.camera_transform[i]).mix(x, .1));
                graphics_state.camera_transform = desired;
            }
        }
    };


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
    class Ring_Shader extends Shader {
        // Subclasses of Shader each store and manage a complete GPU program.
        material() {
            // Materials here are minimal, without any settings.
            return {shader: this}
        }

        map_attribute_name_to_buffer_name(name) {
            // The shader will pull single entries out of the vertex arrays, by their data fields'
            // names.  Map those names onto the arrays we'll pull them from.  This determines
            // which kinds of Shapes this Shader is compatible with.  Thanks to this function,
            // Vertex buffers in the GPU can get their pointers matched up with pointers to
            // attribute names in the GPU.  Shapes and Shaders can still be compatible even
            // if some vertex data feilds are unused.
            return {object_space_pos: "positions"}[name];      // Use a simple lookup table.
        }

        // Define how to synchronize our JavaScript's variables to the GPU's:
        update_GPU(g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl) {
            const proj_camera = g_state.projection_transform.times(g_state.camera_transform);
            // Send our matrices to the shader programs:
            gl.uniformMatrix4fv(gpu.model_transform_loc, false, Mat.flatten_2D_to_1D(model_transform.transposed()));
            gl.uniformMatrix4fv(gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(proj_camera.transposed()));
        }

        shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        {
            return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
        }

        vertex_glsl_code()           // ********* VERTEX SHADER *********
        {
            return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
        
            center = vec4(0,0,object_space_pos.z,1);
            position = vec4( object_space_pos, 1);
            gl_Position = projection_camera_transform * model_transform * position;
        
        
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        }

        fragment_glsl_code()           // ********* FRAGMENT SHADER *********
        {
            return `
        void main()
        { 
            // gl_FragColor = vec4(0.68, 0.35, 0.1, 0.5 * (1.0 + sin(25.0*distance(center, position))));
            float myScale = (1.0 + sin(25.0*distance(center, position)));
            gl_FragColor = myScale * vec4(0.68, 0.35, 0.1, 0.5);
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        }
    };

window.Grid_Sphere = window.classes.Grid_Sphere =
    class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at
    {
        constructor(rows, columns, texture_range)             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
        {
            super("positions", "normals", "texture_coords");
            // TODO:  Complete the specification of a sphere with lattitude and longitude lines
            //        (Extra Credit Part III)

            const semicircle = Array( rows ).fill( Vec.of( 0,0,1 ) ).map((p,n,a) =>
                Mat4.rotation(Math.PI * n/(a.length-1), Vec.of(0,-1,0) ).times( p.to4(1) ).to3());
            Surface_Of_Revolution.insert_transformed_copy_into(this, [rows, columns, semicircle]);

        }
    };