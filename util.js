class Util {
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

class Ld {
	static resPath = "res";
	static objPath = this.resPath + "/" + "obj";

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
		for (let l of Util.rd(this.objPath + "/" + name + ".obj").split("\n")) {
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
		for (let l of Util.rd(this.objPath + "/" + name + ".obj").split("\n")) {
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
