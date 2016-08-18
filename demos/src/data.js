// this is so we can see the component with different videos as lightness of placeholder image and length of title / description can vary wildly


const ids = [
	"5086559154001",
	"5086528258001",
	"5084369376001",
	"5087557269001"
];

function randomId(){
	return ids[Math.floor(Math.random()*ids.length)];
}

module.exports = {
	id: randomId()
};