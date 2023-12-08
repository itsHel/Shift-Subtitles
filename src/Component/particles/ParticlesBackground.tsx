import { useCallback } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import type { Theme } from "../ThemeButton";
import particlesOptions from "./particles-config";

interface ParticlesBackgroundProps {
    theme: Theme;
}

export default function ParticlesBackground({ theme }: ParticlesBackgroundProps) {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    if (theme == "dark") {
        particlesOptions.particles.color.value = "#ffffff";
        particlesOptions.particles.line_linked.color = "#ffffff";
    } else {
        particlesOptions.particles.color.value = "#000000";
        particlesOptions.particles.line_linked.color = "#000000";
    }

    return <Particles className={theme} id="tsparticles" init={particlesInit} options={particlesOptions} />;
}
