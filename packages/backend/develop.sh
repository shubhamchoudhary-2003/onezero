#!/bin/bash

		#Run migrations to ensure the database is updated
		npx medusa migrations run && npx medusa start
		
		#Start development environment
		#npm run start 