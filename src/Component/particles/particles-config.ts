const particlesOptions = {
    particles: {
        number: {
            value: 100,
            density: {
                enable: true,
                value_area: 800,
            },
        },
        color: {
            value: "#ffffff",
        },
        shape: {
            type: "polygon",
            polygon: {
                nb_sides: 5,
            },
        },
        opacity: {
            value: 0.45,
            random: false,
            anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false,
            },
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false,
            },
        },
        line_linked: {
            enable: true,
            distance: 125,
            color: "#ffffff",
            opacity: 0.45,
            width: 1,
        },
        move: {
            enable: true,
            speed: 1.5,
            direction: "none" as const,
            random: false,
            straight: false,
            out_mode: "out" as const,
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
            },
        },
    },
    interactivity: {
        detect_on: "canvas" as const,
        events: {
            onhover: {
                enable: true,
                mode: "grab",
            },
            onclick: {
                enable: true,
                mode: "push",
            },
            resize: true,
        },
        modes: {
            grab: {
                distance: 250,
                line_linked: {
                    opacity: 0.75,
                },
            },
        },
    },
    retina_detect: true,
};

export default particlesOptions;
