class Fs {
	static resPath = "/public/res";
	static objPath = this.resPath + "/obj";
	static texPath = this.resPath + "/tex";

	static rd(fName) {
		let req = new XMLHttpRequest();
		req.open("GET", fName, false);
		req.send(null);

		if (req.status != 200) { // OK
			console.error(`Couldn"t load "${fName}"; status ${req.status}`);

			return;
		}

		return req.responseText;
	}
}

class Ld {
	static ws = " ";

	static sep = "/";

	static id = [
		"v",
		"vt",
		"vn"
	];
	static sz = [
		3,
		2,
		3
	];

	static attr(name, attr) {
		let data = [];
		for (let l of Fs.rd(Fs.objPath + "/" + name + ".obj").split("\n")) {
			let tok = [];
			for (let inst of l.split(this.ws)) {
				tok.push(inst);
			}

			if (tok[0] == this.id[attr]) {
				let pt = tok;
				pt.shift();

				for (let i = 0; i < this.sz[attr]; i++) {
					data.push(pt[i]);
				}
			}
		}

		return data;
	}

	static idc(name, type) {
		let data = [];
		for (let l of Fs.rd(Fs.objPath + "/" + name + ".obj").split("\n")) {
			let tok = [];
			for (let inst of l.split(this.ws)) {
				tok.push(inst);
			}

			if (tok[0] == "f") {
				let idc = tok;
				idc.shift();

				for (let i = 0; i < 3; i++) {
					let idx = idc[i].split(this.sep);

					data.push(idx[type] - 1);
				}
			}
		}

		return data;
	}

	static img(fName) {
		return new Promise((res, rej) => {
			const img = new Image();
			img.onload = () => {
				res(img);
			}
			img.onerror = (e) => {
				rej(e);
			}
			img.src = Fs.texPath + "/" + fName;
		});
	}
}

class HTTP {
	static getSync(url, callback) {
		let req = new XMLHttpRequest();
		req.onreadystatechange = () => {
			if (req.readyState == 4 && req.status == 200) { // OK
				callback(req.responseText);
			}
		}

		req.open("GET", url, false);

		req.send(null);
	}
}

class Geom {
	static calcNorm(pt, i) {
		let startA = i * axes;
		let startB = (i + 1) * axes;
		let startC = (i + 2) * axes;

		let a = vec3.fromValues(pt[startA], pt[startA + 1], pt[startA + 2]);
		let b = vec3.fromValues(pt[startB], pt[startB + 1], pt[startB + 2]);
		let c = vec3.fromValues(pt[startC], pt[startC + 1], pt[startC + 2]);

		let v = [
			vec3.create(),
			vec3.create()
		];
		vec3.sub(v[0], b, a);
		vec3.sub(v[1], c, a);

		let prod = vec3.create();
		vec3.cross(prod, v[0], v[1]);

		vec3.normalize(prod, prod);

		return prod;
	}
}

class Matrix {
	static apply(pt, model) {
		let norm = vec4.clone(pt);
		norm[2] = 0;
		norm[3] = 1;

		vec4.transformMat4(norm, norm, model);

		return model;
	}
}

class Phys {
	static interAxis(u, v) {
		return u[0] <= v[1] && u[1] >= v[0];
	}

	static sat(p, q) {
		for (let s = 0; s < 2; s++) {
			let poly = [
				s ? q : p,
				s ? p : q
			];

			// Transform
			let model = [];
			for (let i = 0; i < 2; i++) {
				model[i] = Matrix.apply(poly[i].pt, poly[i].model);
			}

			for (let p = 0; p < poly[0]._noPt; p++) {
				// Generate line segment
				let a = p;
				let b = (p + 1) % poly[0]._noPt;

				let axis = [
					model[0][b * 2] - model[0][a * 2],
					model[0][(b * 2) + 1] - model[0][(a * 2) + 1]
				];

				// Project
				let d = axis[0] * axis[0] + axis[1] * axis[1]
				for (let i = 0; i < 2; i++) {
					axis[i] /= d;
				}

				// Test overlap
				let rng = [];
				for (let p = 0; p < 2; p++) {
					let bound = [];
					for (let i = 0; i < 2; i++) {
						bound.push(i ? -Infinity : Infinity);
					}
					for (let i = 0; i < poly[p]._noPt; i++) {
						let proj = model[p][i * 2] * axis[0] + model[p][(i * 2) + 1] * axis[1];

						proj = Math.max(proj, bound[0]);
						proj = Math.min(proj, bound[1]);
					}

					rng.push(bound);
				}

				if (!Phys.interAxis(rng[0], rng[1])) {
					return false;
				}
			}
		}

		return true;
	}
}
