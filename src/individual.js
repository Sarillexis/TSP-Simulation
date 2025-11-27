class Individual {
  constructor(mutProb, ...coordinates) {
    this.geneCount = coordinates.length;
    this.mutProb = mutProb;
    this.chromosome = coordinates.slice();
    this.calculateFitness();
  }

  // refactor to normalize fitness values - logic may need to be at population level
  calculateFitness() {
    let sumDist = 0;
    for (let i = 0; i < this.chromosome.length - 1; i++) {
      sumDist += getDistance(this.chromosome[i], this.chromosome[i+1])
    }
    sumDist += getDistance(this.chromosome[0], this.chromosome.slice(-1)[0])
    this.fitness = 1 / sumDist
    this.distance = sumDist;
    return 1 / sumDist;
  }

  mutate() {
    if (Math.random() < this.mutProb) {
      const len = this.chromosome.length;

      // pick two distinct positions
      let idx1 = Math.floor(Math.random() * len);
      let idx2 = Math.floor(Math.random() * len);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * len);
      }

      // ensure idx1 < idx2
      if (idx1 > idx2) [idx1, idx2] = [idx2, idx1];

      // invert the segment between idx1 and idx2 (inclusive)
      while (idx1 < idx2) {
        [this.chromosome[idx1], this.chromosome[idx2]] =
          [this.chromosome[idx2], this.chromosome[idx1]];
        idx1++;
        idx2--;
      }
    }

    this.calculateFitness();
    return this.chromosome;
  }


  mate(crossProb, mutProb, otherInd) {
    // console.log('parent 1 chromosome: ', this.chromosome)
    if (Math.random() < crossProb) {
      let childChromosomes = [];
      while (childChromosomes.length < 2) {
        let idx1 = Math.floor(Math.random() * this.chromosome.length);
        while (idx1 >= this.chromosome.length - 1) {
          idx1 = Math.floor(Math.random() * this.chromosome.length);
        }
        let idx2 = idx1 + Math.ceil(Math.random() * (this.chromosome.length - idx1));
        // let segment = this.chromosome.slice(idx1, idx2);
        // console.log('transplanted segment: ', segment)
        // console.log(idx1, idx2)
        let childChromosome = new Array(this.chromosome.length)
        // inserts random segment of this parent into child at same indices
        for (let i = idx1; i < idx2; i ++) {
          childChromosome[i] = this.chromosome[i];
        }
        // re-arranges parent 2 to make filling child chromosome easier
        let reorderedSecondParent = [];
        for (let i = 0; i < this.chromosome.length; i++) {
          reorderedSecondParent[i] = otherInd.chromosome[(idx2+i) % this.chromosome.length];
        }
        // console.log('childChrom before completion: ', childChromosome)
        let childIdx = idx2;
        reorderedSecondParent.forEach(gene => {
          if (!childChromosome.some(ele => JSON.stringify(ele) === JSON.stringify(gene))) {
            childChromosome[childIdx % this.chromosome.length] = gene;
            childIdx += 1;
            // console.log(childChromosome)
          } 
        })
        // console.log('parent2 original: ', otherInd.chromosome)
        // console.log('parent2 reordered: ', reorderedSecondParent)
        // console.log('childChromosome: ', childChromosome)
        childChromosomes.push(childChromosome)
        childChromosome = [];
      }
      // console.log('child chromosome 1: ', childChromosomes[0])
      // console.log('child chromosome 2: ', childChromosomes[1])
      let children = [];
      childChromosomes.forEach(chromosome => {
        let child = new Individual(this.mutProb, ...chromosome);
        child.mutate(this.mutProb);
        children.push(child)
      })
      // console.log('crossed', children);
      return children;
    } else {
      // need to reassign w/ concat where this is called to build next gen
      let firstParentClone = new Individual(this.mutProb, ...this.chromosome);
      let secondParentClone = new Individual(this.mutProb, ...otherInd.chromosome);
      firstParentClone.mutate(this.mutProb);
      secondParentClone.mutate(this.mutProb);
      // console.log('no cross: ', firstParentClone, secondParentClone)
      return [firstParentClone, secondParentClone];
    }
  }
}

function getDistance(point1, point2) {
  return Math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2);
}

export default Individual;
// module.exports = Individual;