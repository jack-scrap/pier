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
