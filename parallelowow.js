if (typeof registerPaint !== "undefined") {
  registerPaint("parallelowow", class {
    static get inputProperties() {
      return [
        `--parallelowow-tile-width`,
        `--parallelowow-base-color`,
        `--parallelowow-color-step`,
        `--parallelowow-probability`,
        `--parallelowow-stroke-weight`,
      ];
    }

    parseProps(props) {
      return [
        `--parallelowow-tile-width`,
        `--parallelowow-base-color`,
        `--parallelowow-color-step`,
        `--parallelowow-probability`,
        `--parallelowow-stroke-weight`,
      ].map(param => props.get(param).toString().trim() || undefined);
    }

    paint(ctx, geom, properties) {
      let [
        tileWidth = 56,
        baseColor = "#c9f",
        colorStep = -3,
        probability = 0.33,
        strokeWeight = 0.5
      ] = this.parseProps(properties);

      const radians = (Math.PI / 180) * 39.375;
      const tileHeight = tileWidth * (1 / 4);
      const yTiles = geom.height / tileHeight;
      const xTiles = geom.width / tileWidth;
      const outerRadius = geom.width > geom.height ? geom.width * 2 : geom.height * 2;

      let colors = [
        baseColor,
        this.adjustBrightness(baseColor, -10),
        this.adjustBrightness(baseColor, -30)
      ];

      if (strokeWeight > 0) {
        ctx.lineWidth = strokeWeight;
        ctx.strokeStyle = this.adjustBrightness(colors[0], 25);
        ctx.lineCap = "butt";
      }

      for (let y = -1; y < yTiles; y++) {
        const yOffset = y * tileHeight;

        for (let x = -1; x < (xTiles + y); x++) {
          if (Math.random() > probability) {
            const xOffset = (x * tileWidth) - (y * tileHeight);

            // Helpers!
            const upperLeftX = xOffset;
            const upperLeftY = yOffset;
            const upperRightX = xOffset + tileWidth;
            const upperRightY = yOffset;
            const lowerRightX = xOffset + (tileWidth - tileHeight);
            const lowerRightY = yOffset + tileHeight;
            const lowerLeftX = xOffset - tileHeight;
            const lowerLeftY = lowerRightY;

            // 1. Draw shape on the right side of the parallelogram
            ctx.fillStyle = colors[1];
            ctx.beginPath();
            ctx.moveTo(upperRightX, upperRightY);
            ctx.lineTo((Math.cos(radians) * outerRadius), (Math.sin(radians) * outerRadius));
            ctx.lineTo(lowerRightX, lowerRightY);
            ctx.lineTo(upperRightX, upperRightY);
            ctx.fill();

            if (strokeWeight > 0) {
              ctx.stroke();
            }

            // 2. Draw shape on the lower left side of the parallelogram
            ctx.fillStyle = colors[2];
            ctx.beginPath();
            ctx.moveTo(lowerRightX, lowerRightY);
            ctx.lineTo((Math.cos(radians) * outerRadius), (Math.sin(radians) * outerRadius));
            ctx.lineTo(lowerLeftX, lowerLeftY);
            ctx.moveTo(lowerLeftX, lowerLeftY);
            ctx.fill();

            if (strokeWeight > 0) {
              ctx.stroke();
            }

            // 3. Draw parallelogram cap
            ctx.fillStyle = colors[0];
            ctx.beginPath();
            ctx.moveTo(upperLeftX, upperLeftY);
            ctx.lineTo(upperRightX, upperRightY);
            ctx.lineTo(lowerRightX, lowerRightY);
            ctx.lineTo(lowerLeftX, lowerLeftY);
            ctx.lineTo(upperLeftX, upperLeftY);
            ctx.fill();

            if (strokeWeight > 0) {
              ctx.stroke();
            }
          }
        }

        // 4. Slightly darken colors for next run.
        colors = colors.map(colorKey => this.adjustBrightness(colorKey, colorStep));
      }
    }

    isValidHexColor(hex) {
      return /^#?(?:[0-9a-f]{3}){1,2}$/i.test(hex);
    }

    hexToRgb(hex) {
      if (/^#/i.test(hex)) {
        hex = hex.replace("#", "");
      }

      const step = hex.length / 2 === 3 ? 2 : 1;

      if (hex.length === 3) {
        const r = hex.substring(0, 1);
        const g = hex.substring(1, 2);
        const b = hex.substring(2, 3);

        hex = `${r}${r}${g}${g}${b}${b}`;
      }

      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      return `rgb(${r}, ${g}, ${b})`;
    }

    adjustBrightness(colorString, amt) {
      let rgbString = this.isValidHexColor(colorString) ? this.hexToRgb(colorString) : colorString;
      rgbString = rgbString.replace(/rgba?\(/g, "").replace(/\)/g, "").replace(/\s/g, "");

      const rgbParts = rgbString.split(",").map((rgbPart, index) => {
        if (index > 2) {
          return;
        }

        rgbPart = parseInt(rgbPart) + amt;

        if (rgbPart < 0) {
          rgbPart = 0;
        } else if (rgbPart > 255) {
          rgbPart = 255;
        }

        return rgbPart;
      });

      return rgbString.indexOf("rgba") !== -1 ? `rgba(${rgbParts.join(",")})` : `rgb(${rgbParts.join(",")})`;
    }
  });
}
