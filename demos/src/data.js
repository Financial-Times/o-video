
const ids = [
	"5086559154001",
	"5086528258001",
	"5084369376001"
];

function randomId(){
	return ids[Math.floor(Math.random()*ids.length)];
}

module.exports = {
	id: randomId()
};