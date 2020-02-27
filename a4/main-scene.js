window.Assignment_Four_Scene = window.classes.Assignment_Four_Scene =
class Assignment_Four_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   )
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,0,5 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        const shapes = { box:   new Cube(),
                         box_2: new Cube(),
                         axis:  new Axis_Arrows(),
                        extra_credit: new MyShape(),
                       }
                       shapes.box_2.texture_coords = shapes.box_2.texture_coords.map(x => x.times(2));
        this.submit_shapes( context, shapes );

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials =
          {
              phong: context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),
              panda: context.get_instance(Texture_Rotate).material(Color.of(0,0,0,1), {
                  ambient: 1, texture: context.get_instance("assets/panda.jpg", false)
              }),
              redPanda: context.get_instance(Texture_Scroll_X).material(Color.of(0,0,0,1), {
                  ambient: 1, texture: context.get_instance("assets/redPandaMod.jpg", true)
              }),

              extra_credit: context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ) ),

          }

        this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];

        // TODO:  Create any variables that needs to be remembered from frame to frame, such as for incremental movements over time.

          this.isRotating = false;

          //Place the center of cube #1 at (-2,0,0)
          this.transformcube1 = Mat4.identity();
          this.transformcube1 = this.transformcube1.times(Mat4.translation([-2,0,0]));

          // the center of cube #2 at (2,0,0)
          this.transformcube2 = Mat4.identity();
          this.transformcube2 = this.transformcube2.times(Mat4.translation([2,0,0]));

          //Cube 3??
          this.extra_credit = { transform: Mat4.identity().times( Mat4.translation([0, -2, 0]) ) };
      }

      startStop()
      {
          this.isRotating = !this.isRotating;
      }

    make_control_panel()
      { // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        //Use the key ‘c’ (with our usual web buttons) to start and stop the rotation both cubes.
          this.key_triggered_button("Start/Stop Rotation", ["c"], this.startStop);
      }

    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        // TODO:  Draw the required boxes. Also update their stored matrices.
        // this.shapes.axis.draw( graphics_state, Mat4.identity(), this.materials.phong );

          if(this.isRotating)
          {
              this.transformcube1 = this.transformcube1.times(Mat4.rotation(Math.PI * dt, [1,0,0]))
              this.transformcube2 = this.transformcube2.times(Mat4.rotation(0.66 * Math.PI * dt, [0,1,0]))
          }
          
          this.shapes.box.draw(graphics_state, this.transformcube1, this.materials.panda);
          this.shapes.box_2.draw(graphics_state, this.transformcube2, this.materials.redPanda);
          this.extra_credit.translation = this.extra_credit.translation;
          this.shapes.extra_credit.draw( graphics_state, this.extra_credit.transform, this.materials.extra_credit );

      }
  }

class Texture_Scroll_X extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          // vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          //ADDED for the assignment
          vec2 temp = vec2(mod(animation_time, 4.0 ) * 2.0, 0.0);
          vec4 tex_color = texture2D( texture, f_tex_coord + temp);

          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w );
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

class Texture_Rotate extends Phong_Shader
{ fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    {
      // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #7.
      return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.

         //ADDED
         float compute = mod((6.28) * .25 * animation_time, 44. * 3.14);
         mat4 mMatrix = mat4(cos(compute), sin(compute), 0, 0, -sin(compute), cos(compute), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
         vec4 temp = ((vec4(f_tex_coord, 0, 0) + vec4(-.5, -.5, 0., 0.)) * mMatrix) + vec4(.5, .5, 0., 0.);
         vec4 tex_color = texture2D( texture, temp.xy );

          // vec4 tex_color = texture2D( texture, f_tex_coord );                         // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w );
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}

window.MyShape = window.classes.MyShape = class MyShape extends Shape
{
    constructor()
    {
        super( "positions", "normals", "texture_coords" );
        let down = 0.7;

        let scaleMat = Mat4.scale([down, down, down]);
        for( var i = -1; i <= 1; i++ ) {
            for( var j = -1; j <= 1; j++ ) {
                for( var k = -1; k <= 1; k++ ) {
                    let cube_transform = Mat4.identity().times( Mat4.scale( [0.3, 0.3, 0.3] ) );
                    for( var c = 0; c < 6; c++ ) {
                        cube_transform = cube_transform
                            .times( scaleMat )
                            .times( Mat4.translation([1.5*i, 1.5*j, 1.9*k]) );
                        Cube.insert_transformed_copy_into( this, ["positions", "normals", "texture_coords"], cube_transform );
                    }
                }
            }
        }
    }
}
