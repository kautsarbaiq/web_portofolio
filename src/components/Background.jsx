import './Background.css'

/* Global ambient layer: drifting aurora glows, a faint grid, vignette,
   and an animated film-grain overlay. Fixed behind all content. */
export default function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__grid" />
      <div className="bg__aurora bg__aurora--1" />
      <div className="bg__aurora bg__aurora--2" />
      <div className="bg__aurora bg__aurora--3" />
      <div className="bg__vignette" />
      <div className="bg__grain" />
    </div>
  )
}
