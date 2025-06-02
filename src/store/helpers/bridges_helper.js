const icon_bridge_color = '#ffffff' //#eded23
const icon_background = ['#CC3300', '#ff9966', '#ffcc00', '#99cc33', '#339900']
const bridge_icon_template = ({icon_bridge_color, icon_background}) => {
  return `<svg width="512" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs><filter height="200%" width="200%" y="-50%" x="-50%" id="svg_5_blur">
  <feGaussianBlur stdDeviation="10" in="SourceGraphic"/>
  </filter>
  <filter height="200%" width="200%" y="-50%" x="-50%" id="svg_6_blur">
  <feGaussianBlur stdDeviation="9.1" in="SourceGraphic"/>
  </filter></defs>
  <g><rect fill="none" id="canvas_background" height="632" width="514" y="-1" x="-1"/>
  <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
  <rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/></g>
  </g>
  <g><rect stroke="${icon_bridge_color}" filter="url(#svg_5_blur)" rx="10" id="svg_5" height="472" width="503.99997" y="9" x="4.50002" stroke-opacity="null" stroke-width="0" fill="#999999"/>
  <path filter="url(#svg_6_blur)" stroke="${icon_bridge_color}" transform="rotate(180 255.99999999999997,540.5978393554688) " id="svg_6" d="m160,606.59784l96,-131.99996l96,131.99996l-191.99999,0z" stroke-opacity="null" stroke-width="0" fill="#999999"/>
  <g stroke="null" id="svg_4">
  <rect stroke="#ffffff" id="svg_main_sq" height="436.39509" width="470.00004" y="24.04855" x="20.99997" stroke-width="20" fill="${icon_background}"/>
  <path stroke="#ffffff" id="svg_2" d="m353.07568,440.11989l-97.07567,135.83157l-97.07567,-135.83157l194.15135,0z" stroke-width="20" fill="${icon_background}"/>
  <rect stroke="${icon_bridge_color}" id="svg_3" height="418.09153" width="450.81599" y="32.76683" x="30.53374" stroke-opacity="null" stroke-width="0" fill="${icon_background}"/></g>
  <g transform="rotate(180 255,219.5249938964844) " id="svg_11">
  <line stroke="${icon_bridge_color}" stroke-width="29" stroke-linecap="null" stroke-linejoin="null" id="svg_7" y2="159.05" x2="377" y1="160.05" x1="132.99998" stroke-opacity="null" fill="none"/>
  <line stroke-linecap="null" stroke-linejoin="null" id="svg_8" y2="87.05" x2="414.5" y1="166.05" x1="365" fill-opacity="null" stroke-opacity="null" stroke-width="29" stroke="${icon_bridge_color}" fill="none"/>
  <line stroke="${icon_bridge_color}" stroke-linecap="null" stroke-linejoin="null" id="svg_10" y2="87" x2="96" y1="166" x1="145.5" fill-opacity="null" stroke-opacity="null" stroke-width="29" fill="none"/>
  </g>
  <g id="svg_15">
  <line stroke="${icon_bridge_color}" stroke-width="29" stroke-linecap="null" stroke-linejoin="null" id="svg_12" y2="197.05" x2="376.75" y1="198.05" x1="132.74998" stroke-opacity="null" fill="none"/>
  <line stroke-linecap="null" stroke-linejoin="null" id="svg_13" y2="125.05" x2="414.25" y1="204.05" x1="364.75" fill-opacity="null" stroke-opacity="null" stroke-width="29" stroke="${icon_bridge_color}" fill="none"/>
  <line stroke="${icon_bridge_color}" stroke-linecap="null" stroke-linejoin="null" id="svg_14" y2="125" x2="95.75" y1="204" x1="145.25" fill-opacity="null" stroke-opacity="null" stroke-width="29" fill="none"/>
  </g>
  </g></svg>`
}

const start_icon_template = ({icon_color}) => {
  return `<svg width="32px" height="32px">
<path
  d="M24,9c0,4.07-3.06,7.44-7,7.94V30c0,0.55-0.45,1-1,1s-1-0.45-1-1V16.94c-3.94-0.5-7-3.87-7-7.94c0-4.41,3.59-8,8-8S24,4.59,24,9z"
  fill="${icon_color}" />
</svg>`
}

export {icon_bridge_color, icon_background, bridge_icon_template, start_icon_template}
