import Individual from './individual';
import { factorial, shuffleCoordinates, createDistanceCalculator } from './util';

class Population {
  constructor(popSize, crossProb, mutProb, elitismRate, ...coordinates) {
    this.coordinates = coordinates;
    this.popSize = popSize;
    this.crossProb = crossProb;
    this.mutProb = mutProb;
    this.elitismRate = elitismRate;
    this.distanceCalculator = createDistanceCalculator(coordinates);
    this.totalFitness = 0;
    this.currentGen = [];
    this.genNumber = 0;
    this.numPossibleRoutes = factorial(coordinates.length);

    for (let i = 0; i < popSize; i += 1) {
      const chromosome = shuffleCoordinates(coordinates);
      const individual = new Individual(this.distanceCalculator, mutProb, ...chromosome);
      this.currentGen.push(individual);
    }

    this.assignFitness();
    this.fittestEver = this.getFittest();
  }

  assignFitness() {
    this.totalFitness = 0;
    this.currentGen.forEach(individual => {
      individual.rawFitness = 1 / individual.distance;
      this.totalFitness += individual.rawFitness;
    });

    this.currentGen.forEach(individual => {
      individual.fitness = individual.rawFitness / this.totalFitness;
    });
  }

  selectParentTournament(k = 3) {
    let best = null;
    for (let i = 0; i < k; i += 1) {
      const candidate = this.currentGen[Math.floor(Math.random() * this.currentGen.length)];
      if (!best || candidate.distance < best.distance) {
        best = candidate;
      }
    }
    return best;
  }

  createNextGen() {
    let nextGen = [];
    if (this.elitismRate) nextGen = nextGen.concat(this.passElites());

    while (nextGen.length < this.popSize) {
      const parent1 = this.selectParentTournament(3);
      const parent2 = this.selectParentTournament(3);

      const newChildren = parent1.mate(this.crossProb, parent2);
      nextGen = nextGen.concat(newChildren);
    }

    this.currentGen = nextGen.slice(0, this.popSize);
    this.genNumber += 1;

    this.assignFitness();

    const currentGenFittest = this.getFittest();
    if (currentGenFittest.distance < this.fittestEver.distance) {
      this.fittestEver = currentGenFittest;
    }
  }

  passElites() {
    const sortedInds = this.currentGen.slice().sort((a, b) => (a.distance < b.distance ? -1 : 1));
    const numElites = Math.floor(this.elitismRate * this.popSize);
    return sortedInds.slice(0, numElites);
  }

  getFittest() {
    let fittest = this.currentGen[0];
    this.currentGen.forEach(individual => {
      if (individual.distance < fittest.distance) {
        fittest = individual;
      }
    });
    return fittest;
  }
}

export default Population;
