import numeric from "numeric";

export interface Panel {
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
  xMid: number;
  yMid: number;
  length: number;
  theta: number;
  lambda: number; // source strength
  vt: number; // tangential velocity
  cp: number; // pressure coefficient
}

// Generate cylinder geometry
export function createCylinderPanels(N: number, R = 1): Panel[] {
  const panels: Panel[] = [];
  const dTheta = (2 * Math.PI) / N;

  for (let i = 0; i < N; i++) {
    // const thetaStart = -(i - 1 / 2) * dTheta;
    // const thetaEnd = -(i + 1 / 2) * dTheta;

    const thetaStart = Math.PI - (i - 1 / 2) * dTheta;
    const thetaEnd = Math.PI - (i + 1 / 2) * dTheta;

    const xStart = R * Math.cos(thetaStart);
    const yStart = R * Math.sin(thetaStart);
    const xEnd = R * Math.cos(thetaEnd);
    const yEnd = R * Math.sin(thetaEnd);
    const xMid = (xStart + xEnd) / 2;
    const yMid = (yStart + yEnd) / 2;

    panels.push({
      xStart,
      yStart,
      xEnd,
      yEnd,
      xMid,
      yMid,
      length: Math.hypot(xEnd - xStart, yEnd - yStart),
      theta:
        Math.atan2(yEnd - yStart, xEnd - xStart) >= 0
          ? Math.atan2(yEnd - yStart, xEnd - xStart)
          : Math.atan2(yEnd - yStart, xEnd - xStart),
      lambda: 0,
      vt: 0,
      cp: 0,
    });
  }

  return panels;
}

// Compute influence coefficients
function computeInfluenceCoeffs(panels: Panel[]) {
  const N = panels.length;
  const I = Array.from({ length: N }, () => Array(N).fill(0));
  const J = Array.from({ length: N }, () => Array(N).fill(0));

  for (let i = 0; i < N; i++) {
    const pi = panels[i];

    for (let j = 0; j < N; j++) {
      const pj = panels[j];
      const x_i = pi.xMid;
      const X_j = pj.xStart;
      const y_i = pi.yMid;
      const Y_j = pj.yStart;

      if (i === j) {
        I[i][j] = Math.round(0.5 * 2 * Math.PI * 10000) / 10000;
        // I[i][j] = 0.5;
      } else {
        const A =
          -(x_i - X_j) * Math.cos(pj.theta) - (y_i - Y_j) * Math.sin(pj.theta);
        const B = (x_i - X_j) ** 2 + (y_i - Y_j) ** 2;
        const C = Math.sin(pi.theta - pj.theta);
        const D =
          (y_i - Y_j) * Math.cos(pi.theta) - (x_i - X_j) * Math.sin(pi.theta);
        const E = Math.sqrt(B - A ** 2);

        const term1 =
          0.5 * C * Math.log((pj.length ** 2 + 2 * A * pj.length + B) / B);
        const term2 =
          ((D - A * C) / E) * (Math.atan2(pj.length + A, E) - Math.atan2(A, E));
        const term3 =
          ((D - A * C) / (2 * E)) *
            Math.log((pj.length ** 2 + 2 * A * pj.length + B) / B) -
          C * (Math.atan2(pj.length + A, E) - Math.atan2(A, E));

        I[i][j] = Math.round((term1 + term2) * 10000) / 10000;
        J[i][j] = Math.round(term3 * 10000) / 10000;
      }
    }
  }

  return { I, J };
}

// Solve linear system and calculate accurate tangential velocities
export function solvePanelMethod(U_inf: number, N: number) {
  const panels = createCylinderPanels(N);
  const { I, J } = computeInfluenceCoeffs(panels);
  console.log(I);
  console.log(J);
  const b = panels.map((p) => -Math.cos(p.theta + Math.PI / 2));

  const lambda = numeric.solve(I, b);
  console.log(lambda.map((val) => Math.round(val * 10000) / 10000));

  // Assign computed source strengths to panels
  for (let i = 0; i < N; i++) {
    panels[i].lambda = lambda[i];
  }

  // Compute tangential velocities using proper integration
  for (let i = 0; i < N; i++) {
    let vt = U_inf * Math.sin(panels[i].theta + Math.PI / 2);
    // panels[i].lambda * U_inf ; // Free stream contribution

    for (let j = 0; j < N; j++) {
      vt += U_inf * panels[j].lambda * J[i][j];
    }

    panels[i].vt = vt;
    panels[i].cp = 1 - (vt / U_inf) ** 2;
  }

  return panels;
}
