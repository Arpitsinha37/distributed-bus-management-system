# AWS Deployment Guide

This folder contains the `template.yaml` AWS CloudFormation template to automatically provision your backend infrastructure. 

Since you have already deployed the Storefront and Admin Panel to Vercel, this template **only** provisions the required backend pieces:
1. **PostgreSQL** Database (RDS)
2. **Redis** Cache (ElastiCache)
3. **Backend API** Container (ECS Fargate)
4. **Application Load Balancer** (ALB) to route traffic to your Backend API.

## Step 1: Push Your Docker Image to AWS ECR
Before you deploy the infrastructure, AWS needs your Backend Docker image. 
*(If you haven't installed the AWS CLI, you can skip this step and use the AWS Console's CloudShell instead).*

1. Go to the AWS Console -> **Elastic Container Registry (ECR)**.
2. Create a private repository named `bus-booking-backend`.
3. Select the repository and click **View push commands**. Follow the instructions to push your local backend image to ECR.

## Step 2: Deploy CloudFormation Template
1. Log in to your AWS Console.
2. Search for **CloudFormation** in the top search bar.
3. Click **Create stack** -> **With new resources (standard)**.
4. Select **Upload a template file** and choose the `template.yaml` file from this folder.
5. Click **Next**.
6. Give your stack a name (e.g., `bus-booking-backend-stack`).
7. Enter a strong `DBPassword` and `JwtSecret`. *(Note: Your database username defaults to `cms_user`)*.
8. Click **Next**, leave the advanced options as default, and click **Next** again.
9. At the bottom of the review page, check the box that says **"I acknowledge that AWS CloudFormation might create IAM resources"** and click **Submit**.

CloudFormation will now spin up your entire architecture! This process takes about 10-15 minutes (mostly waiting for the Postgres database to start).

## Step 3: Get Your API URL
Once the stack status changes to `CREATE_COMPLETE`:
1. Click on the **Outputs** tab in CloudFormation.
2. Copy the `ApiUrl` value (e.g., `http://bus-booking-alb-1234.us-east-1.elb.amazonaws.com`).
3. Go to your **Vercel Dashboard** for both the Storefront and the Admin Panel.
4. Update the `NEXT_PUBLIC_API_URL` environment variable to point to your new AWS Load Balancer URL + `/api/v1` (e.g., `http://bus-booking-alb-1234.us-east-1.elb.amazonaws.com/api/v1`).
5. Redeploy your Vercel apps.

## Step 4: Database Setup (One-Time)
Once your backend is running on AWS, you need to sync the database schema and seed it. 
Because we exposed the Postgres database publicly in the template (for initial setup), you can simply connect to it from your local machine:
1. Copy the `PostgresEndpoint` from the CloudFormation Outputs tab.
2. In your local `.env` file, change your `DATABASE_URL` to point to the AWS database:
   `DATABASE_URL="postgresql://cms_user:YOUR_PASSWORD@YOUR_AWS_ENDPOINT:5432/bus_booking?schema=public"`
3. Run the migrations and seed locally:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

You are fully live! 🎉
