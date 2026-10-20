import "./landing.css";
import SiteHeader from "../_site/SiteHeader";
import SiteFooter from "../_site/SiteFooter";
import Hero from "./Hero";
import FilmWindow from "./FilmWindow";
import FilmTheater from "./FilmTheater";
import Stall from "./Stall";
import HobbyMap from "./HobbyMap";
import Tour from "./Tour";
import MakeItYours from "./MakeItYours";
import Questions from "./Questions";
import Closer from "./Closer";

// The landing page, in the order the launch film tells it:
//
//   the hook and the film       Hero, FilmWindow
//   the stall                   Stall
//   the map, and forty-seven    HobbyMap
//   what it takes, to memories  Tour
//   make it yours               MakeItYours
//   the closer                  Questions, Closer
//
// A server component: each section that needs the browser opts in on its own,
// so the questions, the footer and the page's frame ship no script.

export default function Landing() {
  return (
    <div className="landing">
      <SiteHeader onLanding />
      <main id="main">
        <Hero />
        <FilmWindow />
        <Stall />
        <HobbyMap />
        <Tour />
        <MakeItYours />
        <Questions />
        <Closer />
      </main>
      <SiteFooter onLanding />
      <FilmTheater />
    </div>
  );
}
