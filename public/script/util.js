class Fs {
	static resPath = "/public/res";
	static objPath = this.resPath + "/obj";

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
				let vtc = tok;
				vtc.shift();

				for (let i = 0; i < this.sz[attr]; i++) {
					data.push(vtc[i]);
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
	static calcNorm(vtc, i) {
		let startA = i * axes;
		let startB = (i + 1) * axes;
		let startC = (i + 2) * axes;

		let a = vec3.fromValues(vtc[startA], vtc[startA + 1], vtc[startA + 2]);
		let b = vec3.fromValues(vtc[startB], vtc[startB + 1], vtc[startB + 2]);
		let c = vec3.fromValues(vtc[startC], vtc[startC + 1], vtc[startC + 2]);

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

class Phys {
	static sat(p, q) {
		for (let s = 0; s < 2; s++) {
			let poly = [
				s ? q : p,
				s ? p : q
			];

			let model = [];
			for (let i = 0; i < 2; i++) {
				model[i] = apply(poly[i]._pt, poly[i].model);
			}

			for (let v = 0; v < poly[0].n; v++) {
				let a = v;
				let b = (v + 1) % poly[0].n;

				let axis = [
					model[0][b * 2] - model[0][a * 2],
					model[0][(b * 2) + 1] - model[0][(a * 2) + 1]
				];
				let d = axis[0] * axis[0] + axis[1] * axis[1]
				for (let i = 0; i < 2; i++) {
					axis[i] /= d;
				}

				let rng = [];
				for (let p = 0; p < 2; p++) {
					let bound = [];
					for (let i = 0; i < 2; i++) {
						bound.push(i ? -Infinity : Infinity);
					}
					for (let i = 0; i < poly[p].n; i++) {
						let proj = (model[p][i * 2] * axis[0] + model[p][(i * 2) + 1] * axis[1]);

						if (proj < bound[0]) {
							bound[0] = proj;
						}

						if (proj > bound[1]) {
							bound[1] = proj;
						}
					}

					rng.push(bound);
				}

				if (!interAxis(rng[0], rng[1])) {
					return false;
				}
			}
		}

		return true;
	}
}
