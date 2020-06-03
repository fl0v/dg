# Dark Galaxy Tools

## Installation
- Get https://www.tampermonkey.net/ (on Chrome) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) on Firefox.
- In GitHub page click on the script you want to install (ex: https://github.com/fl0v/dg/blob/master/alliance.avg.rankings.user.js).
- Using the button in the upper right side open the **RAW** view (https://github.com/fl0v/dg/raw/master/alliance.avg.rankings.user.js).
  - Your browser should detect the script and ask you to install it.
- Visit Dark Galaxy.  

## Scripts overview (click to install)
- **[alliance.avg.rankings.user.js](https://github.com/fl0v/dg/raw/master/alliance.avg.rankings.user.js)** Adds average score info and sorting in Alliance ranking page https://beta.darkgalaxy.com/rankings/alliances/
- **[coords.links.user.js](https://github.com/fl0v/dg/raw/master/coords.links.user.js)** All coordonates (in any page: planets list, radars, news page) will be converted to links to the system's navigation page.
- **[planets.images.user.js](https://github.com/fl0v/dg/raw/master/planets.images.user.js)** Will replace images for all planets. I used https://helloweenpt.com/darkgalaxy/images/planets but feel free to change the baseUrl.
- **[planets.stats.user.js](https://github.com/fl0v/dg/raw/master/planets.stats.user.js)** Will add some totals for your resources in the Planet list page https://beta.darkgalaxy.com/planets/. Also you can copy that info.
- **[planets.total.workers.user.js](https://github.com/fl0v/dg/raw/master/planets.total.workers.user.js)** Will add info about total workers for each planet (sum of iddle and occupied workers). It does not alter the numbers already in page so it should not conflict with other tools.


## TODO
- remove jquery references
- Script: Radar stats by planet/ruller/alliance
- Script: Save alerts to google calendar for fleet arrival, building done, or any custom tick.
- Script: Save post-it notes in any page, attached to a planet or a fleet.
- Script: Process navigation page and export data to 3rd party script.
- Script: Process radar page and export data to 3rd party script.
