# Step 1: Specify the base image
FROM node:22

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Expose the port the application runs on
EXPOSE 3000

# Step 7: Define the command to run the application
CMD ["npm","run","dev"]
